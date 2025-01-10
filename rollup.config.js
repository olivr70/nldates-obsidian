import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    dir: ".",
    sourcemap: "inline",
    format: "cjs",
    exports: "default",
  },
  external: ["obsidian"],
  plugins: [nodeResolve({ browser: true }),commonjs(), typescript(),
    nodeResolve({only: "dayjs/locale/de"}),
    nodeResolve({only: "dayjs/locale/es"}),
    nodeResolve({only: "dayjs/locale/fr"}),
    nodeResolve({only: "dayjs/locale/ja"}),
    nodeResolve({only: "dayjs/locale/pt"}),
    nodeResolve({only: "dayjs/locale/zh"})],
};
