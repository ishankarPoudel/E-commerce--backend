/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/user/user.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrderController } from './../controllers/order/order.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MediaController } from './../controllers/media/media.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GeminiController } from './../controllers/gemini/gemini.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CheckOutController } from './../controllers/checkout/checkout.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CategoryController } from './../controllers/category/category.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CartController } from './../controllers/cart/cart.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BagController } from './../controllers/bag/bag.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth/auth.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminController } from './../controllers/admin/admin.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';
const multer = require('multer');




// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "UserEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "googleId": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "isOauth": {"dataType":"boolean","required":true},
            "provider": {"dataType":"string","required":true},
            "isEmailVerified": {"dataType":"boolean","required":true},
            "deviceInfo": {"ref":"DeviceInfoEntity","required":true},
            "cart": {"ref":"CartEntity","required":true},
            "orders": {"dataType":"array","array":{"dataType":"refObject","ref":"OrderEntity"},"required":true},
            "emailVerificationToken": {"dataType":"string","required":true},
            "emailVerificationTokenExpiresAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "refreshToken": {"dataType":"string","required":true},
            "tokenVersion": {"dataType":"double","required":true},
            "isBanned": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeviceInfoEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "os": {"dataType":"string","required":true},
            "browser": {"dataType":"string","required":true},
            "device": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "user": {"ref":"UserEntity","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CartEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "user": {"ref":"UserEntity","required":true},
            "cartItems": {"dataType":"array","array":{"dataType":"refObject","ref":"CartItemEntity"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BagType": {
        "dataType": "refEnum",
        "enums": ["handbag","backpack","duffel","tote","crossbody","laptop_bag","luggage","suitcase","travel_set","school_bag"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BagEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "name": {"dataType":"string","required":true},
            "type": {"ref":"BagType","required":true},
            "price": {"dataType":"double","required":true},
            "description": {"dataType":"string","required":true},
            "brand": {"dataType":"string","required":true},
            "material": {"dataType":"string","required":true},
            "colors": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "sizes": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "weightKg": {"dataType":"double","required":true},
            "capacityLiters": {"dataType":"double","required":true},
            "isFeatured": {"dataType":"boolean","required":true},
            "categories": {"dataType":"array","array":{"dataType":"refObject","ref":"Category"},"required":true},
            "features": {"ref":"Record_string.boolean_","required":true},
            "images": {"dataType":"array","array":{"dataType":"refObject","ref":"MediaEntity"},"required":true},
            "search_vector": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Category": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "categoryName": {"dataType":"string","required":true},
            "bags": {"dataType":"array","array":{"dataType":"refObject","ref":"BagEntity"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.boolean_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"boolean"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MediaEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "image": {"dataType":"string","required":true},
            "altText": {"dataType":"string"},
            "bag": {"ref":"BagEntity","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CartItemEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "cart": {"ref":"CartEntity","required":true},
            "product": {"ref":"BagEntity","required":true},
            "quantity": {"dataType":"double","required":true},
            "color": {"dataType":"string","required":true},
            "size": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "user": {"ref":"UserEntity","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["paid"]},{"dataType":"enum","enums":["failed"]},{"dataType":"enum","enums":["refunded"]}],"required":true},
            "orderStatus": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["new"]},{"dataType":"enum","enums":["processing"]},{"dataType":"enum","enums":["cancelled"]},{"dataType":"enum","enums":["completed"]}],"required":true},
            "deliveryMethod": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["delivery"]},{"dataType":"enum","enums":["pickup"]}],"required":true},
            "currency": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"OrderItemEntity"}},
            "stripePaymentIntentId": {"dataType":"string"},
            "stripeChargeId": {"dataType":"string"},
            "itemsSnapShot": {"dataType":"any"},
            "shippingAddress": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderItemEntity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "order": {"ref":"OrderEntity","required":true},
            "product": {"ref":"BagEntity","required":true},
            "quantity": {"dataType":"double","required":true},
            "unitPrice": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateCategoryValidator": {
        "dataType": "refObject",
        "properties": {
            "categoryName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddToCartValidator": {
        "dataType": "refObject",
        "properties": {
            "bagId": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "color": {"dataType":"string"},
            "size": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "addBagValidator": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "description": {"dataType":"string","required":true},
            "categories": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "brand": {"dataType":"string","required":true},
            "material": {"dataType":"string","required":true},
            "colors": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "sizes": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "weightKg": {"dataType":"double","required":true},
            "capacityLiters": {"dataType":"double","required":true},
            "isFeatured": {"dataType":"boolean","required":true},
            "type": {"ref":"BagType","required":true},
            "features": {"ref":"Record_string.boolean_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "updateBagValidator": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "price": {"dataType":"double"},
            "description": {"dataType":"string"},
            "categories": {"dataType":"array","array":{"dataType":"string"}},
            "bagImages": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserResponseData": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "accessToken": {"dataType":"string"},
            "refreshToken": {"dataType":"string"},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"user":{"ref":"UserResponseData","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterUserDto": {
        "dataType": "refObject",
        "properties": {
            "fullName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginValidator": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "rememberMe": {"dataType":"boolean"},
            "os": {"dataType":"string","required":true},
            "browser": {"dataType":"string","required":true},
            "device": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router,opts?:{multer?:ReturnType<typeof multer>}) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################

    const upload = opts?.multer ||  multer({"limits":{"fileSize":8388608}});

    
        const argsUserController_getUserById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/user/me',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUserById)),

            async function UserController_getUserById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUserById, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUserById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.patch('/user/update-me',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUserById)),

            async function UserController_updateUserById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUserById, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getAllUsers: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","dataType":"union","subSchemas":[{"dataType":"enum","enums":["name"]},{"dataType":"enum","enums":["joinedAt"]}]},
                order: {"in":"query","name":"order","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
        };
        app.get('/user/all-users',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getAllUsers)),

            async function UserController_getAllUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getAllUsers, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getAllUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getOrderById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                order: {"in":"body","name":"order","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"orderId":{"dataType":"string"}}},
        };
        app.post('/order/get-order-by-id',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getOrderById)),

            async function OrderController_getOrderById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getOrderById, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getOrderById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getAllOrders: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/order/get-all-orders',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getAllOrders)),

            async function OrderController_getAllOrders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getAllOrders, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getAllOrders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getAllOrdersForAdmin: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","dataType":"union","subSchemas":[{"dataType":"enum","enums":["date"]},{"dataType":"enum","enums":["totalAmount"]},{"dataType":"enum","enums":["orderStatus"]},{"dataType":"enum","enums":["deliveryMethod"]}]},
                deliveryMethod: {"in":"query","name":"deliveryMethod","dataType":"union","subSchemas":[{"dataType":"enum","enums":["delivery"]},{"dataType":"enum","enums":["pickup"]}]},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["new"]},{"dataType":"enum","enums":["processing"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["cancelled"]}]},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
        };
        app.get('/order/admin/get-all-orders',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getAllOrdersForAdmin)),

            async function OrderController_getAllOrdersForAdmin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getAllOrdersForAdmin, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getAllOrdersForAdmin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getOrderDetailsByOrderIdForAdmin: Record<string, TsoaRoute.ParameterSchema> = {
                orderId: {"in":"query","name":"orderId","required":true,"dataType":"string"},
        };
        app.get('/order/admin/get-order-details/:orderId',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getOrderDetailsByOrderIdForAdmin)),

            async function OrderController_getOrderDetailsByOrderIdForAdmin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getOrderDetailsByOrderIdForAdmin, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getOrderDetailsByOrderIdForAdmin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_updateOrderStatus: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["new"]},{"dataType":"enum","enums":["processing"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["cancelled"]}],"required":true},"orderId":{"dataType":"string","required":true}}},
        };
        app.post('/order/admin/update-order-status',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.updateOrderStatus)),

            async function OrderController_updateOrderStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_updateOrderStatus, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'updateOrderStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrderController_getAllOrdersOfUserForAdmin: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"query","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/order/admin/get-user-orders/:userId',
            ...(fetchMiddlewares<RequestHandler>(OrderController)),
            ...(fetchMiddlewares<RequestHandler>(OrderController.prototype.getAllOrdersOfUserForAdmin)),

            async function OrderController_getAllOrdersOfUserForAdmin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderController_getAllOrdersOfUserForAdmin, request, response });

                const controller = new OrderController();

              await templateService.apiHandler({
                methodName: 'getAllOrdersOfUserForAdmin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMediaController_uploadMedia: Record<string, TsoaRoute.ParameterSchema> = {
                bagId: {"in":"formData","name":"bagId","required":true,"dataType":"string"},
                file: {"in":"formData","name":"file","required":true,"dataType":"file"},
        };
        app.post('/media/upload',
            upload.fields([
                {
                    name: "file",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(MediaController)),
            ...(fetchMiddlewares<RequestHandler>(MediaController.prototype.uploadMedia)),

            async function MediaController_uploadMedia(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMediaController_uploadMedia, request, response });

                const controller = new MediaController();

              await templateService.apiHandler({
                methodName: 'uploadMedia',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGeminiController_search: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"userMessage":{"dataType":"string","required":true}}},
                serverErrorResponse: {"in":"res","name":"500","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.post('/gemini/search',
            ...(fetchMiddlewares<RequestHandler>(GeminiController)),
            ...(fetchMiddlewares<RequestHandler>(GeminiController.prototype.search)),

            async function GeminiController_search(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGeminiController_search, request, response });

                const controller = new GeminiController();

              await templateService.apiHandler({
                methodName: 'search',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCheckOutController_createPaymentIntent: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"shippingAddress":{"dataType":"string"},"deliveryMethod":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["delivery"]},{"dataType":"enum","enums":["pickup"]}]}}},
        };
        app.post('/checkout/create-payment-intent',
            ...(fetchMiddlewares<RequestHandler>(CheckOutController)),
            ...(fetchMiddlewares<RequestHandler>(CheckOutController.prototype.createPaymentIntent)),

            async function CheckOutController_createPaymentIntent(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCheckOutController_createPaymentIntent, request, response });

                const controller = new CheckOutController();

              await templateService.apiHandler({
                methodName: 'createPaymentIntent',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_addCategory: Record<string, TsoaRoute.ParameterSchema> = {
                category: {"in":"body","name":"category","required":true,"ref":"CreateCategoryValidator"},
        };
        app.post('/category/add-category',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.addCategory)),

            async function CategoryController_addCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_addCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'addCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategories: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/category/get-categories',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategories)),

            async function CategoryController_getCategories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategories, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoriesWithBags: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"in":"query","name":"page","required":true,"dataType":"double"},
                limit: {"in":"query","name":"limit","required":true,"dataType":"double"},
        };
        app.get('/category/get-categories-with-bags',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoriesWithBags)),

            async function CategoryController_getCategoriesWithBags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoriesWithBags, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoriesWithBags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCartController_addToCart: Record<string, TsoaRoute.ParameterSchema> = {
                cart: {"in":"body","name":"cart","required":true,"ref":"AddToCartValidator"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/cart/add-to-cart',
            ...(fetchMiddlewares<RequestHandler>(CartController)),
            ...(fetchMiddlewares<RequestHandler>(CartController.prototype.addToCart)),

            async function CartController_addToCart(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCartController_addToCart, request, response });

                const controller = new CartController();

              await templateService.apiHandler({
                methodName: 'addToCart',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCartController_removeFromCart: Record<string, TsoaRoute.ParameterSchema> = {
                cart: {"in":"body","name":"cart","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"userId":{"dataType":"string"},"bagId":{"dataType":"string","required":true}}},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/cart/remove-from-cart',
            ...(fetchMiddlewares<RequestHandler>(CartController)),
            ...(fetchMiddlewares<RequestHandler>(CartController.prototype.removeFromCart)),

            async function CartController_removeFromCart(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCartController_removeFromCart, request, response });

                const controller = new CartController();

              await templateService.apiHandler({
                methodName: 'removeFromCart',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCartController_updateCart: Record<string, TsoaRoute.ParameterSchema> = {
                cart: {"in":"body","name":"cart","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"quantity":{"dataType":"double","required":true},"bagId":{"dataType":"string","required":true}}},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/cart/update-cart',
            ...(fetchMiddlewares<RequestHandler>(CartController)),
            ...(fetchMiddlewares<RequestHandler>(CartController.prototype.updateCart)),

            async function CartController_updateCart(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCartController_updateCart, request, response });

                const controller = new CartController();

              await templateService.apiHandler({
                methodName: 'updateCart',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCartController_getCart: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/cart/get-cart',
            ...(fetchMiddlewares<RequestHandler>(CartController)),
            ...(fetchMiddlewares<RequestHandler>(CartController.prototype.getCart)),

            async function CartController_getCart(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCartController_getCart, request, response });

                const controller = new CartController();

              await templateService.apiHandler({
                methodName: 'getCart',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_addBag: Record<string, TsoaRoute.ParameterSchema> = {
                bag: {"in":"body","name":"bag","required":true,"ref":"addBagValidator"},
        };
        app.post('/bag/add-bag',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.addBag)),

            async function BagController_addBag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_addBag, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'addBag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_getAllBags: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                category: {"in":"query","name":"category","dataType":"string"},
                minPrice: {"in":"query","name":"minPrice","dataType":"double"},
                maxPrice: {"in":"query","name":"maxPrice","dataType":"double"},
        };
        app.get('/bag/get-all-bags',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.getAllBags)),

            async function BagController_getAllBags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_getAllBags, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'getAllBags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_getBagById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/bag/get-bag/:id',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.getBagById)),

            async function BagController_getBagById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_getBagById, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'getBagById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_updateBag: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                bag: {"in":"body","name":"bag","required":true,"ref":"updateBagValidator"},
        };
        app.patch('/bag/update-bag/:id',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.updateBag)),

            async function BagController_updateBag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_updateBag, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'updateBag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_deleteBagById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/bag/delete-bag/:id',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.deleteBagById)),

            async function BagController_deleteBagById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_deleteBagById, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'deleteBagById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_searchBags: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
        };
        app.get('/bag/search',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.searchBags)),

            async function BagController_searchBags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_searchBags, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'searchBags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBagController_getBagsByCategoryId: Record<string, TsoaRoute.ParameterSchema> = {
                categoryId: {"in":"query","name":"categoryId","required":true,"dataType":"string"},
        };
        app.get('/bag/categorized-bags',
            ...(fetchMiddlewares<RequestHandler>(BagController)),
            ...(fetchMiddlewares<RequestHandler>(BagController.prototype.getBagsByCategoryId)),

            async function BagController_getBagsByCategoryId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBagController_getBagsByCategoryId, request, response });

                const controller = new BagController();

              await templateService.apiHandler({
                methodName: 'getBagsByCategoryId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyOtp: Record<string, TsoaRoute.ParameterSchema> = {
                undefined: {"in":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"otp":{"dataType":"string","required":true}}},
        };
        app.post('/auth/verify-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyOtp)),

            async function AuthController_verifyOtp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyOtp, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyOtp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_resendOtp: Record<string, TsoaRoute.ParameterSchema> = {
                undefined: {"in":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true}}},
        };
        app.post('/auth/resend-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.resendOtp)),

            async function AuthController_resendOtp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_resendOtp, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'resendOtp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_registerUser: Record<string, TsoaRoute.ParameterSchema> = {
                user: {"in":"body","name":"user","required":true,"ref":"RegisterUserDto"},
        };
        app.post('/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.registerUser)),

            async function AuthController_registerUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_registerUser, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'registerUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_loginUser: Record<string, TsoaRoute.ParameterSchema> = {
                user: {"in":"body","name":"user","required":true,"ref":"LoginValidator"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.loginUser)),

            async function AuthController_loginUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_loginUser, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'loginUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_resetPassword: Record<string, TsoaRoute.ParameterSchema> = {
                undefined: {"in":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true}}},
        };
        app.post('/auth/reset-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.resetPassword)),

            async function AuthController_resetPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_resetPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'resetPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_recoverPassword: Record<string, TsoaRoute.ParameterSchema> = {
                undefined: {"in":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"resetToken":{"dataType":"string","required":true},"newPassword":{"dataType":"string","required":true}}},
        };
        app.post('/auth/recover-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.recoverPassword)),

            async function AuthController_recoverPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_recoverPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'recoverPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refreshToken: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/refresh-token',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refreshToken)),

            async function AuthController_refreshToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refreshToken, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refreshToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleAuth: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/google',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleAuth)),

            async function AuthController_googleAuth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleAuth, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleAuth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleCallBack: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/google/callback',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleCallBack)),

            async function AuthController_googleCallBack(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleCallBack, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleCallBack',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_revokeUserSession: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"userId":{"dataType":"string","required":true}}},
        };
        app.post('/auth/admin/revoke-session',
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.revokeUserSession)),

            async function AdminController_revokeUserSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_revokeUserSession, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'revokeUserSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_banUser: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"userId":{"dataType":"string","required":true}}},
        };
        app.post('/auth/admin/ban-user',
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.banUser)),

            async function AdminController_banUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_banUser, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'banUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_unbanUser: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"userId":{"dataType":"string","required":true}}},
        };
        app.post('/auth/admin/unban-user',
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.unbanUser)),

            async function AdminController_unbanUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_unbanUser, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'unbanUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
