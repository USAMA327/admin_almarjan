import React from 'react'

// Reusable Summary Item Component
 const SummaryItem: React.FC<{
    label: string;
    value: string | any;
    formula?: string;
  }> = ({ label, value, formula }) => (
    <div>
      <div className="flex  items-center gap-3 ">
        <p className="text-sm">
          {label}{" "}
          {formula && (
            <span className="text-xs text-primary font-medium">({formula})</span>
          )}
        </p>
        <span className="text-xs text-right font-medium">{value}</span>
      </div>
    </div>
    );
  
    export default SummaryItem
    