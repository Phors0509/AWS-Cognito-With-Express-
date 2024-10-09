const esbuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const fs = require("fs-extra");
const path = require("path");
esbuild
    .build({
        entryPoints: ["src/server.ts"],
        bundle: true,
        platform: "node",
        target: "node20",
        outdir: "build",
        external: ["express", "swagger-ui-express"],
        loader: {
            ".ts": "ts",
        },
        plugins: [
            copy({
                resolveFrom: "cwd",
                assets: [
                    {
                        from: ["node_modules/swagger-ui-dist/*"],
                        to: ["build/"],
                    },
                    {
                        from: ["src/docs/swagger.json"],
                        to: ["build/docs/swagger.json"],
                    },
                    {
                        from: ["ecosystem.config.js"],
                        to: ["build/ecosystem.config.js"],
                    },
                    {
                        from: ["package.json"],
                        to: ["build/package.json"],
                    },
                ],
            }),
        ],
        resolveExtensions: [".ts", ".js"],
        define: {
            "process.env.NODE_ENV": '"production"',
        },
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    })
    .then(() => {
        fs.copySync(
            path.resolve(__dirname, "node_modules/swagger-ui-dist"),
            path.resolve(__dirname, "build")
        );
        console.log("Swagger UI copied successfully!");
        console.log("=========================================");

        fs.copySync(
            path.resolve(__dirname, "src/docs/swagger.json"),
            path.resolve(__dirname, "build/docs/swagger.json")
        );
        console.log("Swagger JSON copied successfully!");
        console.log("=========================================");

        fs.copySync(
            path.resolve(__dirname, "ecosystem.config.js"),
            path.resolve(__dirname, "build/ecosystem.config.js")
        );
        console.log("ecosystem.config.ts copied successfully!");
        console.log("=========================================");

        fs.copySync(
            path.resolve(__dirname, "package.json"),
            path.resolve(__dirname, "build/package.json")
        );
        console.log("package.json copied successfully!");
        console.log("=========================================");
        ("");

        console.log("Build completed successfully!");
        console.log("=========================================");
    })
    .catch((error) => {
        console.error("Build failed:", error);
        process.exit(1);
    });
