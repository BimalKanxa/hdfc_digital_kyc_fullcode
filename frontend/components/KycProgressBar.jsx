export default function KycProgressBar({ stage }) {

  const steps = [
    "AADHAAR_UPLOAD",
    "AADHAAR_OTP",
    "PAN_UPLOAD",
    "SIGNATURE_UPLOAD",
    "PHOTO_UPLOAD",
    "FACE_MATCH",
    "KYC_APPROVAL"
  ];
  
  const labels = {
    AADHAAR_UPLOAD: "Aadhaar Upload",
    AADHAAR_OTP: "Aadhaar OTP",
    PAN_UPLOAD: "PAN Upload",
    SIGNATURE_UPLOAD: "Signature",
    PHOTO_UPLOAD: "Passport Photo",
    FACE_MATCH: "Selfie Match",
    KYC_APPROVAL: "Approval"
  };

  const activeIndex = steps.indexOf(stage);

  return (
    <div className="flex gap-2 items-center justify-center my-4">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center">
          
          {/* Circle */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
            ${idx <= activeIndex ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}
          `}>
            {idx + 1}
          </div>

          {/* Label */}
          <span className="ml-2 mr-4 text-sm">
            {labels[step]}
          </span>

          {/* Arrow */}
          {idx < steps.length - 1 && (
            <span className="text-gray-400">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
