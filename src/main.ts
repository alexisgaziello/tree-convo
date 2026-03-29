import { installIntercept, boot } from './setup';

installIntercept();

if (document.readyState !== 'loading') boot();
else document.addEventListener('DOMContentLoaded', boot);
