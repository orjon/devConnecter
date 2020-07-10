import { createStore, applyMiddleware} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers'; //index.js inside reduces folder

const initialState = {};
const middleware = [ thunk ];

const store = createStore(
  rootReducer, 
  initialState, 
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store;