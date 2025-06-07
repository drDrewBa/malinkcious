import React, { useState, useEffect } from "react";
import { Loader, X } from "lucide-react";
import { PredictionResponse } from "../types";
import { checkMaliciousLink } from "../api";
import { getClassificationDetails } from "../utils";

interface LinkTooltipProps {
  text: string;
}

export const LinkTooltip: React.FC<LinkTooltipProps> = ({ text }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    const checkText = async () => {
      if (!text.trim()) {
        setError("No text provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await checkMaliciousLink(text);
        setResult(response);
      } catch (err) {
        console.error("Error checking link:", err);
        setError(err instanceof Error ? err.message : "Failed to check link");
      } finally {
        setLoading(false);
      }
    };

    checkText();
  }, [text]);

  return (
    <div className="box">
      <div className="content">
        {loading ? (
          <>
            <Loader className="loader icon" />
            <div className="classification">
              <p className="title">Checking link...</p>
              <p className="description">
                Please wait while we analyze this link.
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <X className="x icon" />
            <div className="classification">
              <p className="title">Error checking link</p>
              <p className="description">{error}</p>
            </div>
          </>
        ) : result ? (
          <>
            <div className="icon">
              {getClassificationDetails(result.classification).icon}
            </div>
            <div className="classification">
              <p className="title">
                {getClassificationDetails(result.classification).title}
              </p>
              <p className="description">
                {getClassificationDetails(result.classification).description}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
