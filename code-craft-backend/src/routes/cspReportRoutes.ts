import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../utils/constants';

const router = Router();

/**
 * CSP Report Handler
 * Receives Content Security Policy violation reports from browsers
 */
router.post('/csp-report', (req: Request, res: Response) => {
  try {
    const report = req.body;
    
    // Log CSP violations for security monitoring
    if (report && report['csp-report']) {
      const cspReport = report['csp-report'];
      
      logger.warn('CSP Violation Detected', {
        documentUri: cspReport['document-uri'],
        violatedDirective: cspReport['violated-directive'],
        effectiveDirective: cspReport['effective-directive'],
        originalPolicy: cspReport['original-policy'],
        blockedUri: cspReport['blocked-uri'],
        lineNumber: cspReport['line-number'],
        columnNumber: cspReport['column-number'],
        sourceFile: cspReport['source-file'],
        statusCode: cspReport['status-code'],
        referrer: cspReport['referrer'],
        scriptSample: cspReport['script-sample']?.substring(0, 100), // Limit sample size
        requestId: req.requestId,
        userAgent: req.get('User-Agent')?.substring(0, 100),
        ip: req.ip,
      });
    }
    
    // Always respond with 204 No Content for CSP reports
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    logger.error('Error processing CSP report:', error);
    // Still return 204 to prevent browser from retrying
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
});

export default router;
