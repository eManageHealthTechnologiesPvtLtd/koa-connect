/**
 * If the middleware function does declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
function noCallbackHandler(ctx, connectMiddleware, next) {
	connectMiddleware(ctx.req, ctx.res, next)
	// return next()
  }
  
  /**
   * The middleware function does include the `next` callback so only resolve
   * the Promise when it's called. If it's never called, the middleware stack
   * completion will stall
   */
  function withCallbackHandler(ctx, connectMiddleware, next) {
	return new Promise((resolve, reject) => {
	  connectMiddleware(ctx.req, ctx.res, err => {
		if (err) reject(err)
		else resolve(next())
	  })
	})
  }
  
  function addResBridge(ctx) {
	ctx.res.status = function(statusCode){
		ctx.status = statusCode;
		return this;
	};
	ctx.res.send = function(body) {
		ctx.body = body;
		return this;
	}
	//ctx.res.set = ctx.res.type
	return ctx;
  }
  function addReqBridge(ctx) {
	  ctx.req.body = ctx.request.body;
	  ctx.req.headers =  ctx.headers
	  ctx.req.params = ctx.params;
	  ctx.req.query = ctx.query;
	  return ctx;
  }
  
  /**
   * Returns a Koa middleware function that varies its async logic based on if the
   * given middleware function declares at least 3 parameters, i.e. includes
   * the `next` callback function
   */
  function koaConnect(connectMiddleware) {
	const handler = connectMiddleware.length < 3
	  ? noCallbackHandler
	  : withCallbackHandler
	return function koaConnect(ctx, next) {
	  ctx = addResBridge(addReqBridge(ctx));
	  return handler(ctx, connectMiddleware, next)
	}
  }
  
  module.exports = koaConnect
  