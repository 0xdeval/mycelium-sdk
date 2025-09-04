"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/canonicalize";
exports.ids = ["vendor-chunks/canonicalize"];
exports.modules = {

/***/ "(rsc)/../sdk/node_modules/canonicalize/lib/canonicalize.js":
/*!************************************************************!*\
  !*** ../sdk/node_modules/canonicalize/lib/canonicalize.js ***!
  \************************************************************/
/***/ ((module) => {

eval("/* jshint esversion: 6 */\n/* jslint node: true */\n\n\nmodule.exports = function serialize (object) {\n  if (typeof object === 'number' && isNaN(object)) {\n    throw new Error('NaN is not allowed');\n  }\n\n  if (typeof object === 'number' && !isFinite(object)) {\n    throw new Error('Infinity is not allowed');\n  }\n\n  if (object === null || typeof object !== 'object') {\n    return JSON.stringify(object);\n  }\n\n  if (object.toJSON instanceof Function) {\n    return serialize(object.toJSON());\n  }\n\n  if (Array.isArray(object)) {\n    const values = object.reduce((t, cv, ci) => {\n      const comma = ci === 0 ? '' : ',';\n      const value = cv === undefined || typeof cv === 'symbol' ? null : cv;\n      return `${t}${comma}${serialize(value)}`;\n    }, '');\n    return `[${values}]`;\n  }\n\n  const values = Object.keys(object).sort().reduce((t, cv) => {\n    if (object[cv] === undefined ||\n        typeof object[cv] === 'symbol') {\n      return t;\n    }\n    const comma = t.length === 0 ? '' : ',';\n    return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;\n  }, '');\n  return `{${values}}`;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vc2RrL25vZGVfbW9kdWxlcy9jYW5vbmljYWxpemUvbGliL2Nhbm9uaWNhbGl6ZS5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxpQkFBaUI7QUFDN0MsS0FBSztBQUNMLGVBQWUsT0FBTztBQUN0Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsY0FBYyxHQUFHLHNCQUFzQjtBQUNqRSxHQUFHO0FBQ0gsV0FBVyxFQUFFLFFBQVE7QUFDckIiLCJzb3VyY2VzIjpbIi9Vc2Vycy9hZG1pbi9Eb2N1bWVudHMvcHJvamVjdHMvbXljZWxpdW0tc2RrL3BhY2thZ2VzL3Nkay9ub2RlX21vZHVsZXMvY2Fub25pY2FsaXplL2xpYi9jYW5vbmljYWxpemUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuLyoganNsaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXJpYWxpemUgKG9iamVjdCkge1xuICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiYgaXNOYU4ob2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTmFOIGlzIG5vdCBhbGxvd2VkJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ251bWJlcicgJiYgIWlzRmluaXRlKG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZmluaXR5IGlzIG5vdCBhbGxvd2VkJyk7XG4gIH1cblxuICBpZiAob2JqZWN0ID09PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iamVjdCk7XG4gIH1cblxuICBpZiAob2JqZWN0LnRvSlNPTiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZShvYmplY3QudG9KU09OKCkpO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIGNvbnN0IHZhbHVlcyA9IG9iamVjdC5yZWR1Y2UoKHQsIGN2LCBjaSkgPT4ge1xuICAgICAgY29uc3QgY29tbWEgPSBjaSA9PT0gMCA/ICcnIDogJywnO1xuICAgICAgY29uc3QgdmFsdWUgPSBjdiA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBjdiA9PT0gJ3N5bWJvbCcgPyBudWxsIDogY3Y7XG4gICAgICByZXR1cm4gYCR7dH0ke2NvbW1hfSR7c2VyaWFsaXplKHZhbHVlKX1gO1xuICAgIH0sICcnKTtcbiAgICByZXR1cm4gYFske3ZhbHVlc31dYDtcbiAgfVxuXG4gIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5rZXlzKG9iamVjdCkuc29ydCgpLnJlZHVjZSgodCwgY3YpID0+IHtcbiAgICBpZiAob2JqZWN0W2N2XSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIHR5cGVvZiBvYmplY3RbY3ZdID09PSAnc3ltYm9sJykge1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1hID0gdC5sZW5ndGggPT09IDAgPyAnJyA6ICcsJztcbiAgICByZXR1cm4gYCR7dH0ke2NvbW1hfSR7c2VyaWFsaXplKGN2KX06JHtzZXJpYWxpemUob2JqZWN0W2N2XSl9YDtcbiAgfSwgJycpO1xuICByZXR1cm4gYHske3ZhbHVlc319YDtcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/../sdk/node_modules/canonicalize/lib/canonicalize.js\n");

/***/ })

};
;