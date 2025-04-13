import bcryptjs from 'bcryptjs';

const hashedPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10); 
  const hash = await bcryptjs.hash(password, salt);
  return hash;
};

const comparePasswords = async (plainPassword, hashedPassword) => {
  const isMatch = await bcryptjs.compare(plainPassword, hashedPassword);
  return isMatch;
};

export { hashedPassword, comparePasswords };
