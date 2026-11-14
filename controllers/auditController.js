const auditService = require('../services/auditService');

function getAuditHistory(req, res, next) {
    try {
        const logs = auditService.getRecentAuditLogs(10);
        return res.status(200).json({
            success: true,
            message: 'Recent audit records retrieved successfully.',
            count: logs.length,
            data: logs
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAuditHistory
};
