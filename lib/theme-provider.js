"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _compose = _interopRequireDefault(require("./compose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function ThemeProvider(context) {
  return class ThemeProvider extends React.PureComponent {
    constructor(props) {
      super(props);
    }

    render() {
      const {
        theme,
        children
      } = this.props;
      const newContext = {
        theme,
        compose: _compose.default
      };
      return React.createElement(context.Provider, {
        value: newContext
      }, children);
    }

  };
}

var _default = ThemeProvider;
exports.default = _default;