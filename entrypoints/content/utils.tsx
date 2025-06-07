import React from 'react';
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PredictionResponse, ClassificationDetails } from './types';

export const getClassificationDetails = (classification: PredictionResponse["classification"]): ClassificationDetails => {
  switch (classification) {
    case "benign":
      return {
        icon: <CheckCircle2 className="check" />,
        title: "Link is Safe",
        description: "No threats detected. It's safe to visit this site.",
      };
    case "defacement":
      return {
        icon: <AlertCircle className="warning" />,
        title: "Potential Defacement",
        description: "This site may be visually altered or tampered with.",
      };
    case "phishing":
      return {
        icon: <AlertCircle className="danger" />,
        title: "Phishing Risk",
        description: "This link may trick you into giving away sensitive info. Avoid it.",
      };
    case "malware":
      return {
        icon: <AlertCircle className="danger" />,
        title: "Malware Threat",
        description: "This site could install harmful software. Do not continue.",
      };
  }
}; 