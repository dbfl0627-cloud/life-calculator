import React from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './App';
export {ROUTES, SITE_URL} from './routes';
export {FAQ, DSR_FAQ, LTV_FAQ} from './faq';
export function render(path:string){ return renderToString(<React.StrictMode><App initialPath={path}/></React.StrictMode>); }
