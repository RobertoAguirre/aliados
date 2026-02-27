export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DHK2-_rY.js",app:"_app/immutable/entry/app.Dne99-5I.js",imports:["_app/immutable/entry/start.DHK2-_rY.js","_app/immutable/chunks/RH5iYlAy.js","_app/immutable/chunks/BHAR4PZv.js","_app/immutable/chunks/Cvnl7q1J.js","_app/immutable/entry/app.Dne99-5I.js","_app/immutable/chunks/ZQhg5A-s.js","_app/immutable/chunks/BHAR4PZv.js","_app/immutable/chunks/BsxsctS-.js","_app/immutable/chunks/D8t6tpFo.js","_app/immutable/chunks/Cvnl7q1J.js","_app/immutable/chunks/Cl2nnox4.js","_app/immutable/chunks/DyR-G55m.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/crear-red",
				pattern: /^\/crear-red\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/mi-red",
				pattern: /^\/mi-red\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/r/[codigo]",
				pattern: /^\/r\/([^/]+?)\/?$/,
				params: [{"name":"codigo","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/r/[codigo]/registro",
				pattern: /^\/r\/([^/]+?)\/registro\/?$/,
				params: [{"name":"codigo","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
