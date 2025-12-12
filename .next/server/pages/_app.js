/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/AuthGuard.jsx":
/*!**********************************!*\
  !*** ./components/AuthGuard.jsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ AuthGuard)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/supabase */ \"./lib/supabase.js\");\n\n\n\n\nfunction AuthGuard({ children }) {\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const [authenticated, setAuthenticated] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        let mounted = true;\n        // Verificar sesión actual y procesar callback de OAuth si existe\n        const checkSession = async ()=>{\n            // Procesar el hash de la URL si viene del callback de OAuth\n            const { data: { session: hashSession } } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.getSession();\n            if (mounted) {\n                if (hashSession) {\n                    setAuthenticated(true);\n                    setLoading(false);\n                } else {\n                    // Verificar si hay un hash en la URL (callback de OAuth)\n                    const hashParams = new URLSearchParams( false ? 0 : \"\");\n                    if (hashParams.get(\"access_token\") || hashParams.get(\"error\")) {\n                        // Esperar a que onAuthStateChange maneje el callback\n                        return;\n                    }\n                    router.push(\"/login\");\n                    setLoading(false);\n                }\n            }\n        };\n        checkSession();\n        // Escuchar cambios en la autenticación\n        const { data: { subscription } } = _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.onAuthStateChange((event, session)=>{\n            if (!mounted) return;\n            if (session) {\n                setAuthenticated(true);\n                setLoading(false);\n                // Limpiar el hash de la URL después del login exitoso\n                if (false) {}\n            } else {\n                if (event === \"SIGNED_OUT\") {\n                    router.push(\"/login\");\n                }\n                setLoading(false);\n            }\n        });\n        return ()=>{\n            mounted = false;\n            subscription.unsubscribe();\n        };\n    }, [\n        router\n    ]);\n    if (loading) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            style: {\n                display: \"flex\",\n                alignItems: \"center\",\n                justifyContent: \"center\",\n                minHeight: \"100vh\",\n                backgroundColor: \"#0d1117\",\n                color: \"#c9d1d9\"\n            },\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                children: \"Cargando...\"\n            }, void 0, false, {\n                fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/components/AuthGuard.jsx\",\n                lineNumber: 78,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/components/AuthGuard.jsx\",\n            lineNumber: 70,\n            columnNumber: 7\n        }, this);\n    }\n    if (!authenticated) {\n        return null;\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: children\n    }, void 0, false);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0F1dGhHdWFyZC5qc3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQTRDO0FBQ0o7QUFDRztBQUU1QixTQUFTSSxVQUFVLEVBQUVDLFFBQVEsRUFBRTtJQUM1QyxNQUFNLENBQUNDLFNBQVNDLFdBQVcsR0FBR04sK0NBQVFBLENBQUM7SUFDdkMsTUFBTSxDQUFDTyxlQUFlQyxpQkFBaUIsR0FBR1IsK0NBQVFBLENBQUM7SUFDbkQsTUFBTVMsU0FBU1Isc0RBQVNBO0lBRXhCRixnREFBU0EsQ0FBQztRQUNSLElBQUlXLFVBQVU7UUFFZCxpRUFBaUU7UUFDakUsTUFBTUMsZUFBZTtZQUNuQiw0REFBNEQ7WUFDNUQsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLFNBQVNDLFdBQVcsRUFBRSxFQUFFLEdBQUcsTUFBTVosbURBQVFBLENBQUNhLElBQUksQ0FBQ0MsVUFBVTtZQUV6RSxJQUFJTixTQUFTO2dCQUNYLElBQUlJLGFBQWE7b0JBQ2ZOLGlCQUFpQjtvQkFDakJGLFdBQVc7Z0JBQ2IsT0FBTztvQkFDTCx5REFBeUQ7b0JBQ3pELE1BQU1XLGFBQWEsSUFBSUMsZ0JBQ3JCLE1BQWtCLEdBQWNDLENBQWlDLEdBQUc7b0JBR3RFLElBQUlGLFdBQVdNLEdBQUcsQ0FBQyxtQkFBbUJOLFdBQVdNLEdBQUcsQ0FBQyxVQUFVO3dCQUM3RCxxREFBcUQ7d0JBQ3JEO29CQUNGO29CQUVBZCxPQUFPZSxJQUFJLENBQUM7b0JBQ1psQixXQUFXO2dCQUNiO1lBQ0Y7UUFDRjtRQUVBSztRQUVBLHVDQUF1QztRQUN2QyxNQUFNLEVBQ0pDLE1BQU0sRUFBRWEsWUFBWSxFQUFFLEVBQ3ZCLEdBQUd2QixtREFBUUEsQ0FBQ2EsSUFBSSxDQUFDVyxpQkFBaUIsQ0FBQyxDQUFDQyxPQUFPZDtZQUMxQyxJQUFJLENBQUNILFNBQVM7WUFFZCxJQUFJRyxTQUFTO2dCQUNYTCxpQkFBaUI7Z0JBQ2pCRixXQUFXO2dCQUNYLHNEQUFzRDtnQkFDdEQsSUFBSSxLQUFxRCxFQUFFLEVBRTFEO1lBQ0gsT0FBTztnQkFDTCxJQUFJcUIsVUFBVSxjQUFjO29CQUMxQmxCLE9BQU9lLElBQUksQ0FBQztnQkFDZDtnQkFDQWxCLFdBQVc7WUFDYjtRQUNGO1FBRUEsT0FBTztZQUNMSSxVQUFVO1lBQ1ZlLGFBQWFNLFdBQVc7UUFDMUI7SUFDRixHQUFHO1FBQUN0QjtLQUFPO0lBRVgsSUFBSUosU0FBUztRQUNYLHFCQUNFLDhEQUFDMkI7WUFBSUMsT0FBTztnQkFDVkMsU0FBUztnQkFDVEMsWUFBWTtnQkFDWkMsZ0JBQWdCO2dCQUNoQkMsV0FBVztnQkFDWEMsaUJBQWlCO2dCQUNqQkMsT0FBTztZQUNUO3NCQUNFLDRFQUFDUDswQkFBSTs7Ozs7Ozs7Ozs7SUFHWDtJQUVBLElBQUksQ0FBQ3pCLGVBQWU7UUFDbEIsT0FBTztJQUNUO0lBRUEscUJBQU87a0JBQUdIOztBQUNaIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGVtcGxhdGUtZWRpdG9yLy4vY29tcG9uZW50cy9BdXRoR3VhcmQuanN4PzY1MmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSAnLi4vbGliL3N1cGFiYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXV0aEd1YXJkKHsgY2hpbGRyZW4gfSkge1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2F1dGhlbnRpY2F0ZWQsIHNldEF1dGhlbnRpY2F0ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBtb3VudGVkID0gdHJ1ZTtcblxuICAgIC8vIFZlcmlmaWNhciBzZXNpw7NuIGFjdHVhbCB5IHByb2Nlc2FyIGNhbGxiYWNrIGRlIE9BdXRoIHNpIGV4aXN0ZVxuICAgIGNvbnN0IGNoZWNrU2Vzc2lvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgIC8vIFByb2Nlc2FyIGVsIGhhc2ggZGUgbGEgVVJMIHNpIHZpZW5lIGRlbCBjYWxsYmFjayBkZSBPQXV0aFxuICAgICAgY29uc3QgeyBkYXRhOiB7IHNlc3Npb246IGhhc2hTZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgICAgXG4gICAgICBpZiAobW91bnRlZCkge1xuICAgICAgICBpZiAoaGFzaFNlc3Npb24pIHtcbiAgICAgICAgICBzZXRBdXRoZW50aWNhdGVkKHRydWUpO1xuICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFZlcmlmaWNhciBzaSBoYXkgdW4gaGFzaCBlbiBsYSBVUkwgKGNhbGxiYWNrIGRlIE9BdXRoKVxuICAgICAgICAgIGNvbnN0IGhhc2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKFxuICAgICAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkgOiAnJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGhhc2hQYXJhbXMuZ2V0KCdhY2Nlc3NfdG9rZW4nKSB8fCBoYXNoUGFyYW1zLmdldCgnZXJyb3InKSkge1xuICAgICAgICAgICAgLy8gRXNwZXJhciBhIHF1ZSBvbkF1dGhTdGF0ZUNoYW5nZSBtYW5lamUgZWwgY2FsbGJhY2tcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgcm91dGVyLnB1c2goJy9sb2dpbicpO1xuICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNoZWNrU2Vzc2lvbigpO1xuXG4gICAgLy8gRXNjdWNoYXIgY2FtYmlvcyBlbiBsYSBhdXRlbnRpY2FjacOzblxuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHsgc3Vic2NyaXB0aW9uIH0sXG4gICAgfSA9IHN1cGFiYXNlLmF1dGgub25BdXRoU3RhdGVDaGFuZ2UoKGV2ZW50LCBzZXNzaW9uKSA9PiB7XG4gICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcbiAgICAgIFxuICAgICAgaWYgKHNlc3Npb24pIHtcbiAgICAgICAgc2V0QXV0aGVudGljYXRlZCh0cnVlKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIC8vIExpbXBpYXIgZWwgaGFzaCBkZSBsYSBVUkwgZGVzcHXDqXMgZGVsIGxvZ2luIGV4aXRvc29cbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZXZlbnQgPT09ICdTSUdORURfT1VUJykge1xuICAgICAgICAgIHJvdXRlci5wdXNoKCcvbG9naW4nKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtb3VudGVkID0gZmFsc2U7XG4gICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9O1xuICB9LCBbcm91dGVyXSk7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIG1pbkhlaWdodDogJzEwMHZoJyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzBkMTExNycsXG4gICAgICAgIGNvbG9yOiAnI2M5ZDFkOScsXG4gICAgICB9fT5cbiAgICAgICAgPGRpdj5DYXJnYW5kby4uLjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGlmICghYXV0aGVudGljYXRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIDw+e2NoaWxkcmVufTwvPjtcbn1cblxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlUm91dGVyIiwic3VwYWJhc2UiLCJBdXRoR3VhcmQiLCJjaGlsZHJlbiIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiYXV0aGVudGljYXRlZCIsInNldEF1dGhlbnRpY2F0ZWQiLCJyb3V0ZXIiLCJtb3VudGVkIiwiY2hlY2tTZXNzaW9uIiwiZGF0YSIsInNlc3Npb24iLCJoYXNoU2Vzc2lvbiIsImF1dGgiLCJnZXRTZXNzaW9uIiwiaGFzaFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsImdldCIsInB1c2giLCJzdWJzY3JpcHRpb24iLCJvbkF1dGhTdGF0ZUNoYW5nZSIsImV2ZW50IiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsInBhdGhuYW1lIiwidW5zdWJzY3JpYmUiLCJkaXYiLCJzdHlsZSIsImRpc3BsYXkiLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJtaW5IZWlnaHQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJjb2xvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/AuthGuard.jsx\n");

/***/ }),

/***/ "./styles/editor.css":
/*!***************************!*\
  !*** ./styles/editor.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "./styles/settings.css":
/*!*****************************!*\
  !*** ./styles/settings.css ***!
  \*****************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "./lib/supabase.js":
/*!*************************!*\
  !*** ./lib/supabase.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n\nconst supabaseUrl = \"https://cvinihbkfvnxvtihozxp.supabase.co\";\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aW5paGJrZnZueHZ0aWhvenhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzQ2MTIsImV4cCI6MjA3OTg1MDYxMn0.7lnRCVfXaciTOLQn90lzLIQq1F9aNBD_bXHjFjW2Y-Q\";\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error(\"Missing Supabase environment variables\");\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvc3VwYWJhc2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBcUQ7QUFFckQsTUFBTUMsY0FBY0MsMENBQW9DO0FBQ3hELE1BQU1HLGtCQUFrQkgsa05BQXlDO0FBRWpFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcEMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRU8sTUFBTUMsV0FBV1IsbUVBQVlBLENBQUNDLGFBQWFJLGlCQUFpQiIsInNvdXJjZXMiOlsid2VicGFjazovL3RlbXBsYXRlLWVkaXRvci8uL2xpYi9zdXBhYmFzZS5qcz8xNTk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMO1xuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzJyk7XG59XG5cbmV4cG9ydCBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VBbm9uS2V5KTtcblxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlQW5vbktleSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiRXJyb3IiLCJzdXBhYmFzZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/supabase.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var _styles_editor_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/editor.css */ \"./styles/editor.css\");\n/* harmony import */ var _styles_settings_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/settings.css */ \"./styles/settings.css\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var _components_AuthGuard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/AuthGuard */ \"./components/AuthGuard.jsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__]);\n_tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\nfunction App({ Component, pageProps }) {\n    const [queryClient] = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(()=>new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClient({\n            defaultOptions: {\n                queries: {\n                    refetchOnWindowFocus: false,\n                    retry: 1\n                }\n            }\n        }));\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter)();\n    const isLoginPage = router.pathname === \"/login\";\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClientProvider, {\n        client: queryClient,\n        children: isLoginPage ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/pages/_app.js\",\n            lineNumber: 24,\n            columnNumber: 9\n        }, this) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_AuthGuard__WEBPACK_IMPORTED_MODULE_6__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/pages/_app.js\",\n                lineNumber: 27,\n                columnNumber: 11\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/pages/_app.js\",\n            lineNumber: 26,\n            columnNumber: 9\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/Chalo/Documents/Agroanalytics/Proyectos/2pdf/pages/_app.js\",\n        lineNumber: 22,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUE4QjtBQUNFO0FBQ3lDO0FBQ3hDO0FBQ087QUFDUTtBQUVqQyxTQUFTSyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ2xELE1BQU0sQ0FBQ0MsWUFBWSxHQUFHTiwrQ0FBUUEsQ0FBQyxJQUFNLElBQUlGLDhEQUFXQSxDQUFDO1lBQ25EUyxnQkFBZ0I7Z0JBQ2RDLFNBQVM7b0JBQ1BDLHNCQUFzQjtvQkFDdEJDLE9BQU87Z0JBQ1Q7WUFDRjtRQUNGO0lBRUEsTUFBTUMsU0FBU1Ysc0RBQVNBO0lBQ3hCLE1BQU1XLGNBQWNELE9BQU9FLFFBQVEsS0FBSztJQUV4QyxxQkFDRSw4REFBQ2Qsc0VBQW1CQTtRQUFDZSxRQUFRUjtrQkFDMUJNLDRCQUNDLDhEQUFDUjtZQUFXLEdBQUdDLFNBQVM7Ozs7O2lDQUV4Qiw4REFBQ0gsNkRBQVNBO3NCQUNSLDRFQUFDRTtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7O0FBS2xDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGVtcGxhdGUtZWRpdG9yLy4vcGFnZXMvX2FwcC5qcz9lMGFkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3R5bGVzL2VkaXRvci5jc3MnO1xuaW1wb3J0ICcuLi9zdHlsZXMvc2V0dGluZ3MuY3NzJztcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JztcbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuaW1wb3J0IEF1dGhHdWFyZCBmcm9tICcuLi9jb21wb25lbnRzL0F1dGhHdWFyZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgY29uc3QgW3F1ZXJ5Q2xpZW50XSA9IHVzZVN0YXRlKCgpID0+IG5ldyBRdWVyeUNsaWVudCh7XG4gICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgIHF1ZXJpZXM6IHtcbiAgICAgICAgcmVmZXRjaE9uV2luZG93Rm9jdXM6IGZhbHNlLFxuICAgICAgICByZXRyeTogMSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSkpO1xuXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCBpc0xvZ2luUGFnZSA9IHJvdXRlci5wYXRobmFtZSA9PT0gJy9sb2dpbic7XG5cbiAgcmV0dXJuIChcbiAgICA8UXVlcnlDbGllbnRQcm92aWRlciBjbGllbnQ9e3F1ZXJ5Q2xpZW50fT5cbiAgICAgIHtpc0xvZ2luUGFnZSA/IChcbiAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPEF1dGhHdWFyZD5cbiAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICAgIDwvQXV0aEd1YXJkPlxuICAgICAgKX1cbiAgICA8L1F1ZXJ5Q2xpZW50UHJvdmlkZXI+XG4gICk7XG59XG5cbiJdLCJuYW1lcyI6WyJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJ1c2VTdGF0ZSIsInVzZVJvdXRlciIsIkF1dGhHdWFyZCIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInF1ZXJ5Q2xpZW50IiwiZGVmYXVsdE9wdGlvbnMiLCJxdWVyaWVzIiwicmVmZXRjaE9uV2luZG93Rm9jdXMiLCJyZXRyeSIsInJvdXRlciIsImlzTG9naW5QYWdlIiwicGF0aG5hbWUiLCJjbGllbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();