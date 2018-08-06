"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _compose = _interopRequireDefault(require("./compose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const whatReactComponent = component => {
  if (typeof component !== 'string' && component.prototype && component.prototype.render) {
    return "class";
  }

  return "stateless";
};

const create = (Component, config) => {
  const BaseComponent = whatReactComponent(Component) === "stateless" ? React.PureComponent : config.pure ? React.PureComponent : React.Component;
  const Context = config.context;
  return () => React.createElement(Context.Consumer, null, theme => React.createElement(Component, {
    theme: theme
  }));
};

const factory = defaults => {
  const themed = context => (theme = [], options) => Component => {
    let themes = [];
    let themesCss = [];

    let config = _objectSpread({}, defaults);

    if (theme.locals) {
      themes.push(theme.locals);
      themesCss.push({
        locals: theme.locals,
        css: theme.toString()
      });
    } else if (theme) {
      themes.push(theme);
    }

    Object.assign(config, options, {
      themes,
      themesCss,
      context
    });
    return create(Component, config);
  };

  return themed;
};

var _default = factory({
  compose: _compose.default,
  pure: false,
  propName: 'theme'
});

exports.default = _default;