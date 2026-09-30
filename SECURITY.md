# Security Policy

## Supported Versions

Currently, only the latest version of FinanzasMundo is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public issue for the vulnerability
2. **Do not** disclose the vulnerability publicly
3. Send an email to the maintainer with details about the vulnerability
4. Allow time for the vulnerability to be fixed before disclosing it

## Security Best Practices

This project follows these security best practices:

- No sensitive data (API keys, secrets) is stored in the repository
- All data sources are from official, public APIs
- Environment variables are used for configuration
- Dependencies are regularly updated
- No user authentication data is stored on the server
- CORS is properly configured
- Input validation is implemented

## Data Sources

All financial data comes from official sources:

- **Banco Central Europeo (BCE)**: Public API, no authentication required
- **Banco Mundial**: Public API, CC BY 4.0 license
- **SEC (US Securities and Exchange Commission)**: Public domain data
- **Coinbase**: Public API endpoint

None of these sources require API keys or store user data.

## Dependencies

We regularly audit and update dependencies to ensure security. If you find a security issue in a dependency, please report it through the appropriate channels.

## Disclaimer

This project is for educational purposes only and does not constitute financial advice. All financial data is provided "as is" without warranties of accuracy or completeness.
