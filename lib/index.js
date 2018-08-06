"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = exports.ThemeProvider = exports.themed = exports.flush = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactThemed = _interopRequireDefault(require("./react-themed"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const Context = React.createContext();
const {
  flush,
  themed,
  ThemeProvider,
  compose
} = (0, _reactThemed.default)(Context);
exports.compose = compose;
exports.ThemeProvider = ThemeProvider;
exports.themed = themed;
exports.flush = flush;