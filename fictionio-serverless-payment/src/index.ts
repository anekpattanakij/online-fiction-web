import { paymentService } from './paymentService';
import { topupPriceService } from './topupPriceService';
import { withdrawRateService } from './withdrawRateService';
import { withdrawService } from './withdrawService';

export const payment = paymentService;

export const topupPrice = topupPriceService;

export const withdrawRate = withdrawRateService;

export const withdraw = withdrawService;
