import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
    },
});
//* OR
//* export default [body('email').notEmpty().withMessage('Email is required')];
