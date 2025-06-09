import React from 'react';
import { Loader, XCircle } from 'lucide-react';

interface StatusTooltipProps {
  isProcessing: boolean;
  linksProcessed: number;
  onClose?: () => void;
}

const StatusTooltip: React.FC<StatusTooltipProps> = ({ 
  isProcessing, 
  linksProcessed,
  onClose 
}) => {
  return (
    <div className="box">
      <div className="content">
        <div className="icon">
          {isProcessing ? (
            <Loader className="loader" />
          ) : (
            <XCircle className="danger" />
          )}
        </div>
        <div className="classification">
          <p className="title">
            {isProcessing ? 'Processing Links...' : `${linksProcessed} Links Made Unclickable`}
          </p>
          <p className="description">
            {isProcessing 
              ? 'Please wait while we check links on this page'
              : (
                <>
                  Open malinkcious to turn this off.{' '}
                  <span
                    className="text-zinc"
                    onClick={onClose}
                    style={{ display: 'inline-block', marginLeft: '4px', cursor: 'pointer', textDecoration: 'underline', color: '#52525c' }}
                  >
                    Close
                  </span>
                </>
              )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusTooltip; 