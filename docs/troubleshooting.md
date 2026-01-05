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

## Debugging

- **Console Logs**: Check the browser console (F12) and the terminal where `npm run dev` is running for detailed error messages.
- **Curl Tests**: You can manually test connectivity using curl:
  ```bash
  curl http://localhost:11434/api/tags
  ```
