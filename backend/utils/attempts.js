exports.checkAttempts = (attempts, stage) => {
  if (attempts[stage] >= 3) {
    return { allowed: false, message: "Maximum attempts reached" };
  }

  return { allowed: true };
};
