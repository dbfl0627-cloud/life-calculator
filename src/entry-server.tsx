import React from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './App';
export {ROUTES} from './routes';
export function render(path:string){ return renderToString(<React.StrictMode><App initialPath={path}/></React.StrictMode>); }
