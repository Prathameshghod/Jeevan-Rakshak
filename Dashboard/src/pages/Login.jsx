import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Fade,
  Paper,
  alpha,
  styled
} from '@mui/material';
import {
  LockOutlined,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  WaterDrop,
  HealthAndSafety,
  AdminPanelSettings,
  LocationOn,
  Person,
  Shield,
  ArrowForward
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import './Auth.css';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 60px rgba(0, 102, 204, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #0066cc 0%, #7b1fa2 100%)'
  }
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: alpha('#0066cc', 0.05),
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#0066cc', 0.1),
    transform: 'translateX(4px)'
  }
}));

// Validation Schemas
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const signupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  zone: Yup.string().required('Zone selection is required'),
  role: Yup.string().required('Please select a role'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase and number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

// Data
const zones = [
  { value: 'zone1', label: 'Dharampeth (Zone 1)' },
  { value: 'zone2', label: 'Sadar (Zone 2)' },
  { value: 'zone3', label: 'Dhantoli (Zone 3)' },
  { value: 'zone4', label: 'Hanuman Nagar (Zone 4)' },
  { value: 'zone5', label: 'Gandhibagh (Zone 5)' },
  { value: 'zone6', label: 'Laxmi Nagar (Zone 6)' },
  { value: 'zone7', label: 'Ashi Nagar (Zone 7)' },
  { value: 'zone8', label: 'Nehru Nagar (Zone 8)' },
  { value: 'zone9', label: 'Lakadganj (Zone 9)' },
  { value: 'zone10', label: 'Mangalwari (Zone 10)' }
];

const roles = [
  {
    value: 'user',
    label: 'Citizen User',
    icon: <Person />,
    description: 'Report issues and receive alerts',
    color: '#2196f3'
  },
  {
    value: 'admin',
    label: 'Administrator',
    icon: <AdminPanelSettings />,
    description: 'Manage zones and monitor systems',
    color: '#7b1fa2'
  },
  {
    value: 'asha-worker',
    label: 'ASHA Worker',
    icon: <HealthAndSafety />,
    description: 'Submit health reports and field data',
    color: '#00c853'
  }
];

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);
      
      const userRef = ref(database, `users/${user.uid}`);
      const { get } = await import('firebase/database');
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('userRole', userData.role || 'user');
        localStorage.setItem('userName', userData.name || 'User');
        localStorage.setItem('userZone', userData.zone || '');
        
        const role = userData.role || 'user';
        if (role === 'admin') {
          navigate('/dashboard');
        } else if (role === 'asha-worker') {
          navigate('/asha-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    } catch (error) {
      setError(error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password. Please try again.' 
        : 'Unable to sign in. Please check your connection and try again.'
      );
    }
  };

  const handleSignup = async (values) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await set(ref(database, `users/${user.uid}`), {
        name: values.name,
        email: values.email,
        role: values.role,
        zone: values.zone,
        createdAt: Date.now(),
      });

      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', values.role);
      localStorage.setItem('userName', values.name);
      localStorage.setItem('userZone', values.zone);

      if (values.role === 'admin') {
        navigate('/dashboard');
      } else if (values.role === 'asha-worker') {
        navigate('/asha-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      setError(error.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please sign in or use a different email.'
        : 'Unable to create account. Please try again.'
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Box className="auth-background" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Brand & Info */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{ 
                height: '100%', 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                color: 'white',
                boxShadow: '0 20px 40px rgba(26, 35, 126, 0.3)'
              }}>
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28
                    }}>
                      💧
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Jeevan-Rakshak
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                        Smart Public Health & Water Monitoring
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Empowering Nagpur's Health Infrastructure
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    {[
                      { icon: '📊', text: 'Real-time water quality monitoring across 10 zones' },
                      { icon: '🚨', text: 'Early outbreak detection and prevention' },
                      { icon: '📱', text: 'Citizen-driven complaint resolution system' },
                      { icon: '🤖', text: 'AI-powered risk prediction models' },
                      { icon: '📍', text: 'GIS-based zone management and analytics' },
                      { icon: '🏥', text: 'Integrated health data from hospitals & ASHA workers' }
                    ].map((feature, index) => (
                      <FeatureItem key={index}>
                        <Box sx={{ fontSize: '1.25rem' }}>{feature.icon}</Box>
                        <Typography variant="body2">{feature.text}</Typography>
                      </FeatureItem>
                    ))}
                  </Box>

                  <Box sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 3, 
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>10+</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>Zones</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>500+</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>Sensors</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>24/7</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>Monitoring</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Right Side - Auth Form */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StyledPaper>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0066cc 0%, #7b1fa2 100%)',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
                  }}>
                    {isLogin ? (
                      <LockOutlined sx={{ fontSize: 36, color: 'white' }} />
                    ) : (
                      <PersonAdd sx={{ fontSize: 36, color: 'white' }} />
                    )}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {isLogin ? 'Welcome Back' : 'Join the Mission'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {isLogin 
                      ? 'Sign in to access your dashboard and contribute to community health'
                      : 'Create an account to report issues and help make Nagpur healthier'
                    }
                  </Typography>
                </Box>

                {error && (
                  <Fade in={!!error}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.light'
                      }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    role: 'user',
                    zone: ''
                  }}
                  validationSchema={isLogin ? loginSchema : signupSchema}
                  onSubmit={isLogin ? handleLogin : handleSignup}
                >
                  {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid, setFieldValue }) => (
                    <Form>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {!isLogin && (
                          <>
                            <motion.div variants={itemVariants}>
                              <TextField
                                fullWidth
                                name="name"
                                label="Full Name"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                                sx={{ mb: 3 }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Person color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <TextField
                                fullWidth
                                name="email"
                                label="Email Address"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                sx={{ mb: 3 }}
                                placeholder="name@nagpur.gov.in"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Email color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </motion.div>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                              <Grid item xs={6}>
                                <motion.div variants={itemVariants}>
                                  <FormControl fullWidth error={touched.password && !!errors.password}>
                                    <TextField
                                      name="password"
                                      label="Password"
                                      type={showPassword ? 'text' : 'password'}
                                      value={values.password}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      error={touched.password && !!errors.password}
                                      helperText={touched.password && errors.password}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton
                                              onClick={() => setShowPassword(!showPassword)}
                                              edge="end"
                                              size="small"
                                            >
                                              {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </FormControl>
                                </motion.div>
                              </Grid>
                              <Grid item xs={6}>
                                <motion.div variants={itemVariants}>
                                  <TextField
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.confirmPassword && !!errors.confirmPassword}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                  />
                                </motion.div>
                              </Grid>
                            </Grid>

                            <motion.div variants={itemVariants}>
                              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Select Your Role
                              </Typography>
                              <Grid container spacing={2} sx={{ mb: 3 }}>
                                {roles.map((role) => (
                                  <Grid item xs={4} key={role.value}>
                                    <Box
                                      className={`role-option ${values.role === role.value ? 'selected' : ''}`}
                                      onClick={() => setFieldValue('role', role.value)}
                                      sx={{
                                        textAlign: 'center',
                                        py: 2,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Box sx={{ 
                                        color: role.color, 
                                        mb: 1,
                                        fontSize: '1.5rem'
                                      }}>
                                        {role.icon}
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {role.label}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {role.description}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <FormControl fullWidth error={touched.zone && !!errors.zone} sx={{ mb: 3 }}>
                                <InputLabel>Select Zone</InputLabel>
                                <Select
                                  name="zone"
                                  value={values.zone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  label="Select Zone"
                                  startAdornment={
                                    <InputAdornment position="start">
                                      <LocationOn color="action" />
                                    </InputAdornment>
                                  }
                                >
                                  {zones.map((zone) => (
                                    <MenuItem key={zone.value} value={zone.value}>
                                      {zone.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {touched.zone && errors.zone && (
                                  <Typography color="error" variant="caption">
                                    {errors.zone}
                                  </Typography>
                                )}
                              </FormControl>
                            </motion.div>
                          </>
                        )}

                        {isLogin && (
                          <>
                            <motion.div variants={itemVariants}>
                              <TextField
                                fullWidth
                                name="email"
                                label="Email Address"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                sx={{ mb: 3 }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Email color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <TextField
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.password && !!errors.password}
                                helperText={touched.password && errors.password}
                                sx={{ mb: 3 }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="small"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </motion.div>
                          </>
                        )}

                        <motion.div variants={itemVariants}>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmitting || !isValid}
                            sx={{
                              py: 2,
                              borderRadius: 3,
                              fontSize: '1rem',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #0066cc 0%, #7b1fa2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #0052a3 0%, #6a1b9a 100%)',
                                boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
                              },
                              '&.Mui-disabled': {
                                background: '#e0e0e0'
                              }
                            }}
                            endIcon={!isSubmitting && <ArrowForward />}
                          >
                            {isSubmitting ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : isLogin ? (
                              'Sign In to Dashboard'
                            ) : (
                              'Create Account'
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </Form>
                  )}
                </Formik>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                      }}
                      variant="text"
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#0066cc'
                      }}
                    >
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </Button>
                  </Typography>
                </Box>

                <Divider sx={{ my: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Nagpur Municipal Corporation
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </Typography>
                </Box>
              </StyledPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      
      {/* Water Wave Effect */}
      <div className="water-wave"></div>
    </Box>
  );
};

export default Login;