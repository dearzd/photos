import React from 'react';
import {createDevTools} from 'redux-devtools';
import DockMonitor from 'redux-devtools-dock-monitor';
import LogMonitor from 'redux-devtools-log-monitor';

const DevTools = createDevTools(
	<DockMonitor toggleVisibilityKey='ctrl-q' changePositionKey='ctrl-h' defaultIsVisible={false}>
		<LogMonitor/>
	</DockMonitor>
);

export default DevTools;
