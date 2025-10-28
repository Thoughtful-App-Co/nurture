// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ["mjs", "js", "json", "ts", "tsx", "cjs"];
config.resolver.requireCycleIgnorePatterns = [/(^|\/|\\)node_modules($|\/|\\)/];

module.exports = withNativeWind(config, { input: "./global.css" });
