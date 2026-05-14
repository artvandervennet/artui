# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Instead, use GitHub's
private reporting:

1. Go to the [Security tab](https://github.com/artvandervennet/artui/security)
   on this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, the affected package, and a reproduction if possible.

You can expect:

- An acknowledgement within 5 business days.
- A coordinated fix and disclosure plan for confirmed issues.
- Credit in the release notes once a fix ships, if you would like that.

## Supported versions

Only the most recent minor version of each published package
(`@artui/cli`, `@artui/mcp`) receives fixes. The `@artui/registry`
components themselves are copy-pasted into consumer projects, so once
copied they are owned by that project — fixes are published as updated
component sources that the CLI can re-fetch.
