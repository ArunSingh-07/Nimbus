# Troubleshooting

## Common Errors

### "AI suggestion unavailable: AI service error: 500 Internal Server Error"

**Cause**: This usually happens when the Ollama backend fails to run the model.
**Specific Error**: `model requires more system memory ... than is available`.
**Solution**:
1.  **Use a smaller model**: Switch to `tinyllama`, `qwen:0.5b`, or `phi`.
2.  **Free up RAM**: Close other applications.

### "AI suggestion unavailable (Configuration missing)"

**Cause**: The application cannot find the URL for the selected source (`local` or `cloud`).
**Solution**: Check your `.env.local` file and ensure `OLLAMA_LOCAL_URL` (and `OLLAMA_CLOUD_URL` if using cloud) are set correctly.

### "Connection Refused" (fetch failed)

**Cause**: The application cannot connect to the Ollama instance.
**Solution**:
1.  Ensure Ollama is running (`ollama serve`).
2.  Verify the URL in `.env.local` is correct.
3.  If running in a container, ensure `localhost` refers to the correct host machine.

### Application Fails to Load / WebContainer Error

**Cause**: Your browser may not support WebContainers (e.g., Safari, older browsers) or third-party cookies are blocked.
**Solution**:
1.  **Use a supported browser**: Chrome, Edge, or Firefox (latest versions).
2.  **Enable Third-Party Cookies**: WebContainers require `SharedArrayBuffer` which may be blocked by strict privacy settings or incognito mode.
3.  **Not Secure Context**: Ensure you are accessing the app via `localhost` or `https`. WebContainers do not work on plain `http` (except localhost).

### Changes are not saving

**Cause**: You might have unsaved changes in the editor that haven't been synchronized.
**Solution**:
1.  **Manual Save**: Press `Ctrl + S` or click the "Save" icon in the top right.
2.  **Check Console**: Open developer tools (F12) to see if there are any network errors preventing the save.

## Debugging

- **Console Logs**: Check the browser console (F12) and the terminal where `npm run dev` is running for detailed error messages.
- **Curl Tests**: You can manually test connectivity using curl:
  ```bash
  curl http://localhost:11434/api/tags
  ```
