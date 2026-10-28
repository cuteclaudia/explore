import {defineMiddleware} from 'astro:middleware';
import {withActorRequest} from '../server/request-actor.mjs';

export const onRequest=defineMiddleware((context,next)=>withActorRequest(context.request,next));
