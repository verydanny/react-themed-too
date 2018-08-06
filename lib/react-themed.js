"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _themed = _interopRequireDefault(require("./themed"));

var _themeProvider = _interopRequireDefault(require("./theme-provider"));

var _compose = _interopRequireDefault(require("./compose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function createThemed(context) {
  function flush(Component) {}

  const reactThemed = {
    flush,
    themed: (0, _themed.default)(context),
    ThemeProvider: (0, _themeProvider.default)(context),
    compose: _compose.default
  };
  return reactThemed;
}

var _default = createThemed;
exports.default = _default;