// User registration with proper hashing
router.post('/register', catchAsync(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }
  
  // Hash password properly
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await db.insert(users).values({
    email,
    password_hash: hashedPassword,  // Correct field name
    first_name: firstName,          // Match schema field name
    last_name: lastName,            // Match schema field name
    role: 'patient'
  }).returning();
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: { id: newUser[0].id, email: newUser[0].email }
  });
}));
