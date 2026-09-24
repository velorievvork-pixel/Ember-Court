#!/usr/bin/env python3
"""PreToolUse guard for outbound Gmail tools (send_message, reply, forward).

Reads the hook payload from stdin and, before any email leaves:
  * denies malformed recipient addresses, blocked domains, and (when an
    allowlist is configured) any domain not on it
  * denies messages with more recipients than `max_recipients`
  * denies bodies, subjects, or text attachments that contain secrets
    (API keys, tokens, private keys, credential-like assignments)
  * denies attachments with sensitive filenames (.env, .pem, id_rsa, ...)
  * asks for confirmation when sending an existing draft, because its
    contents are not visible to the hook

Optional config lives next to this file in outbound_guard.json; see
DEFAULT_CONFIG for the keys. Every decision is appended to
outbound_guard.log (JSON lines, no message bodies).

Fails closed: if the payload cannot be parsed, the send is denied.
"""

import base64
import json
import os
import re
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "outbound_guard.json")
LOG_PATH = os.path.join(HERE, "outbound_guard.log")

DEFAULT_CONFIG = {
    # If non-empty, only these domains (and their subdomains) may receive mail.
    "allowed_domains": [],
    # These domains (and their subdomains) may never receive mail.
    "blocked_domains": [],
    "max_recipients": 20,
    # Ask before sending a draft by id, since its content can't be inspected.
    "ask_on_draft_send": True,
    # Text attachments larger than this are not decoded for secret scanning.
    "max_scan_bytes": 2_000_000,
}

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+'-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$")

SECRET_PATTERNS = [
    ("private key", re.compile(r"-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----")),
    ("AWS access key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b")),
    ("Anthropic API key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}")),
    ("OpenAI API key", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}")),
    ("Stripe secret key", re.compile(r"\b[rs]k_live_[A-Za-z0-9]{20,}")),
    ("Slack token", re.compile(r"\bxox[abposr]-[A-Za-z0-9-]{10,}")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("JWT", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")),
    ("database URL with password", re.compile(r"\b[a-z+]+://[^\s:/@]+:[^\s@/]{4,}@[^\s/]+")),
    ("credential assignment", re.compile(
        r"(?i)\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\b"
        r"\s*[:=]\s*['\"]?[^\s'\"]{8,}")),
]

SENSITIVE_FILENAMES = re.compile(
    r"(?i)(^|/)(\.env(\..*)?|id_(rsa|dsa|ecdsa|ed25519)|\.npmrc|\.pypirc|credentials(\.json)?"
    r"|.*\.(pem|key|p12|pfx|jks|keystore|kdbx))$")

TEXT_MIME_PREFIXES = ("text/", "application/json", "application/xml", "application/x-yaml",
                      "application/yaml", "application/javascript", "application/x-sh")


def load_config():
    config = dict(DEFAULT_CONFIG)
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH) as f:
            config.update(json.load(f))
    config["allowed_domains"] = [d.lower().lstrip("@") for d in config["allowed_domains"]]
    config["blocked_domains"] = [d.lower().lstrip("@") for d in config["blocked_domains"]]
    return config


def domain_matches(domain, domains):
    return any(domain == d or domain.endswith("." + d) for d in domains)


def check_recipients(tool_input, config):
    problems = []
    recipients = []
    for field in ("to", "cc", "bcc"):
        value = tool_input.get(field) or []
        if isinstance(value, str):
            value = [value]
        recipients.extend(str(r).strip() for r in value)

    if len(recipients) > config["max_recipients"]:
        problems.append(f"{len(recipients)} recipients exceeds max_recipients={config['max_recipients']}")

    for addr in recipients:
        if not EMAIL_RE.match(addr):
            problems.append(f"invalid recipient address: {addr!r}")
            continue
        domain = addr.rsplit("@", 1)[1].lower()
        if domain_matches(domain, config["blocked_domains"]):
            problems.append(f"recipient domain is blocked: {addr}")
        elif config["allowed_domains"] and not domain_matches(domain, config["allowed_domains"]):
            problems.append(f"recipient domain is not in allowed_domains: {addr}")
    return recipients, problems


def scan_text(label, text):
    return [f"{name} found in {label}" for name, pattern in SECRET_PATTERNS if pattern.search(text)]


def check_content(tool_input, config):
    problems = []
    for field in ("subject", "body", "htmlBody", "forwardText"):
        text = tool_input.get(field)
        if isinstance(text, str) and text:
            problems.extend(scan_text(field, text))

    for i, att in enumerate(tool_input.get("attachments") or []):
        name = att.get("filename") or f"attachment #{i + 1}"
        if SENSITIVE_FILENAMES.search(name):
            problems.append(f"sensitive attachment filename: {name}")
        mime = (att.get("mimeType") or "").lower()
        content = att.get("content") or ""
        if mime.startswith(TEXT_MIME_PREFIXES) and len(content) * 3 // 4 <= config["max_scan_bytes"]:
            try:
                decoded = base64.b64decode(content, validate=False).decode("utf-8", "replace")
            except (ValueError, TypeError):
                continue
            problems.extend(scan_text(f"attachment {name}", decoded))
    return problems


def log(entry):
    entry["ts"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    try:
        with open(LOG_PATH, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except OSError:
        pass


def respond(decision, reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": decision,
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main():
    try:
        payload = json.load(sys.stdin)
        tool_name = payload["tool_name"]
        tool_input = payload.get("tool_input") or {}
        config = load_config()
    except Exception as e:  # fail closed
        log({"decision": "deny", "error": repr(e)})
        respond("deny", f"outbound_guard could not evaluate this send ({e!r}); blocking by default.")

    if tool_input.get("draftId") and config["ask_on_draft_send"]:
        log({"tool": tool_name, "decision": "ask", "draftId": tool_input["draftId"]})
        respond("ask", "Sending an existing draft; outbound_guard cannot inspect its contents. "
                       "Confirm the draft's recipients and body before sending.")

    recipients, problems = check_recipients(tool_input, config)
    problems += check_content(tool_input, config)

    entry = {"tool": tool_name, "recipients": recipients,
             "messageId": tool_input.get("messageId"), "replyAll": tool_input.get("replyAll")}
    if problems:
        log({**entry, "decision": "deny", "problems": problems})
        respond("deny", "outbound_guard blocked this email:\n- " + "\n- ".join(problems))

    log({**entry, "decision": "allow"})
    sys.exit(0)  # no opinion: normal permission flow continues


if __name__ == "__main__":
    main()
