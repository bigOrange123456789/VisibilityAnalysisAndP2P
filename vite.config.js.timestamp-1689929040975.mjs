// vite.config.js
import path from "path";
import glsl from "file:///F:/gitHubRepositories/VisibilityAnalysisAndP2P/node_modules/vite-plugin-glsl/dist/index.js";
import viteCompression from "file:///F:/gitHubRepositories/VisibilityAnalysisAndP2P/node_modules/vite-plugin-compression/dist/index.mjs";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///F:/gitHubRepositories/VisibilityAnalysisAndP2P/vite.config.js";
var fileName = fileURLToPath(__vite_injected_original_import_meta_url);
var dirName = path.dirname(fileName);
var vite_config_default = {
  plugins: [glsl.default(), viteCompression({ algorithm: "brotliCompress" })],
  resolve: {
    alias: [
      { find: "realism-effects", replacement: "../src/index.js" },
      { find: "three", replacement: dirName + "/node_modules/three" },
      { find: "postprocessing", replacement: dirName + "/node_modules/postprocessing" }
    ]
  },
  server: {
    fs: {
      allow: [".."]
    }
  }
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxnaXRIdWJSZXBvc2l0b3JpZXNcXFxcVmlzaWJpbGl0eUFuYWx5c2lzQW5kUDJQXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxnaXRIdWJSZXBvc2l0b3JpZXNcXFxcVmlzaWJpbGl0eUFuYWx5c2lzQW5kUDJQXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9naXRIdWJSZXBvc2l0b3JpZXMvVmlzaWJpbGl0eUFuYWx5c2lzQW5kUDJQL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxuaW1wb3J0IGdsc2wgZnJvbSBcInZpdGUtcGx1Z2luLWdsc2xcIlxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIlxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJ1cmxcIlxuXG5jb25zdCBmaWxlTmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKVxuY29uc3QgZGlyTmFtZSA9IHBhdGguZGlybmFtZShmaWxlTmFtZSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRwbHVnaW5zOiBbZ2xzbC5kZWZhdWx0KCksIHZpdGVDb21wcmVzc2lvbih7IGFsZ29yaXRobTogXCJicm90bGlDb21wcmVzc1wiIH0pXSxcblx0cmVzb2x2ZToge1xuXHRcdGFsaWFzOiBbXG5cdFx0XHR7IGZpbmQ6IFwicmVhbGlzbS1lZmZlY3RzXCIsIHJlcGxhY2VtZW50OiBcIi4uL3NyYy9pbmRleC5qc1wiIH0sXG5cdFx0XHR7IGZpbmQ6IFwidGhyZWVcIiwgcmVwbGFjZW1lbnQ6IGRpck5hbWUgKyBcIi9ub2RlX21vZHVsZXMvdGhyZWVcIiB9LFxuXHRcdFx0eyBmaW5kOiBcInBvc3Rwcm9jZXNzaW5nXCIsIHJlcGxhY2VtZW50OiBkaXJOYW1lICsgXCIvbm9kZV9tb2R1bGVzL3Bvc3Rwcm9jZXNzaW5nXCIgfVxuXHRcdF1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0ZnM6IHtcblx0XHRcdGFsbG93OiBbXCIuLlwiXVxuXHRcdH1cblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxPQUFPLFVBQVU7QUFDblYsT0FBTyxVQUFVO0FBQ2pCLE9BQU8scUJBQXFCO0FBQzVCLFNBQVMscUJBQXFCO0FBSDJLLElBQU0sMkNBQTJDO0FBSzFQLElBQU0sV0FBVyxjQUFjLHdDQUFlO0FBQzlDLElBQU0sVUFBVSxLQUFLLFFBQVEsUUFBUTtBQUVyQyxJQUFPLHNCQUFRO0FBQUEsRUFDZCxTQUFTLENBQUMsS0FBSyxRQUFRLEdBQUcsZ0JBQWdCLEVBQUUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBQUEsRUFDMUUsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sRUFBRSxNQUFNLG1CQUFtQixhQUFhLGtCQUFrQjtBQUFBLE1BQzFELEVBQUUsTUFBTSxTQUFTLGFBQWEsVUFBVSxzQkFBc0I7QUFBQSxNQUM5RCxFQUFFLE1BQU0sa0JBQWtCLGFBQWEsVUFBVSwrQkFBK0I7QUFBQSxJQUNqRjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNILE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDYjtBQUFBLEVBQ0Q7QUFDRDsiLAogICJuYW1lcyI6IFtdCn0K