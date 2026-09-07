import { Router } from 'express';
import { onboardUser } from './onboarding.service.js';
import { requirePrivyAuth } from '../../middleware/privyAuth.js';
export const onboardingRouter = Router();
onboardingRouter.post('/', requirePrivyAuth, async (req, res) => {
    const { userAddress, value, deadline, signature, name, phoneNumber } = req.body;
    const result = await onboardUser(req.privyUserId, userAddress, BigInt(value), BigInt(deadline), signature, name, phoneNumber);
    res.json(result);
});
