# /apps

Place your `General-Store.apk` here before running tests.

The APK path is resolved in `src/config/capabilities.ts` and can be overridden
with the `APP_PATH` environment variable.

```bash
APP_PATH=/absolute/path/to/General-Store.apk npm test
```
