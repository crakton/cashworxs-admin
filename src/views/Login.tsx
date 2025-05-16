'use client';

// React Imports
import type { FormEvent } from 'react';
import { useState } from 'react';

// Next Imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Type Imports
import type { Mode } from '@core/types';

// Component Imports
import Logo from '@components/layout/shared/Logo';
import Illustrations from '@components/Illustrations';

// Config Imports
import themeConfig from '@configs/themeConfig';

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { login, clearError } from '@/store/slices/authSlice';

const Login = ({ mode }: { mode: Mode }) => {
	// States
	const [isPasswordShown, setIsPasswordShown] = useState(false);

	const [formData, setFormData] = useState({
		phone_number: '',
		password: ''
	});

	const [rememberMe, setRememberMe] = useState(false);

	// Redux
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector(state => state.auth);

	// Vars
	const darkImg = '/images/pages/auth-v1-mask-dark.png';
	const lightImg = '/images/pages/auth-v1-mask-light.png';

	// Hooks
	const router = useRouter();
	const authBackground = useImageVariant(mode, lightImg, darkImg);

	const handleClickShowPassword = () => setIsPasswordShown(show => !show);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRememberMe(e.target.checked);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (error) {
			dispatch(clearError());
		}

		try {
			const resultAction = await dispatch(login(formData));

			if (login.fulfilled.match(resultAction) && resultAction.payload.user.is_admin) {
				router.push('/');
			}
		} catch (error) {
			console.error('Login failed:', error);
		}
	};

	return (
		<div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
			<Card className='flex flex-col sm:is-[450px]'>
				<CardContent className='p-6 sm:!p-12'>
					<Link href='/' className='flex justify-center items-center mbe-6'>
						<Logo />
					</Link>
					<div className='flex flex-col gap-5'>
						<div>
							<Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
							<Typography className='mbs-1'>Please sign-in</Typography>
						</div>
						{error && (
							<Alert severity='error' onClose={() => dispatch(clearError())}>
								{error}
							</Alert>
						)}
						<form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
							<TextField
								autoFocus
								fullWidth
								label='Phone number'
								name='phone_number'
								value={formData.phone_number}
								inputProps={{
									maxLength: 11,
									pattern: '[0-9]*',
									inputMode: 'numeric'
								}}
								onChange={e => {
									const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);

									setFormData(prev => ({
										...prev,
										phone_number: value
									}));
								}}
								required
								error={formData.phone_number.length > 0 && formData.phone_number.length !== 11}
								helperText={
									formData.phone_number.length > 0 && formData.phone_number.length !== 11
										? 'Phone number must be 11 digits'
										: ''
								}
							/>
							<TextField
								fullWidth
								label='Password'
								name='password'
								value={formData.password}
								onChange={handleChange}
								required
								id='outlined-adornment-password'
								type={isPasswordShown ? 'text' : 'password'}
								InputProps={{
									endAdornment: (
										<>
											<InputAdornment position='end'></InputAdornment>
											<IconButton
												size='small'
												edge='end'
												onClick={handleClickShowPassword}
												onMouseDown={e => e.preventDefault()}
											>
												<i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
											</IconButton>
										</>
									)
								}}
							/>
							<div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
								<FormControlLabel
									control={<Checkbox checked={rememberMe} onChange={handleCheckbox} />}
									label='Remember me'
								/>
								<Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
									Forgot password?
								</Typography>
							</div>
							<Button fullWidth variant='contained' type='submit' disabled={isLoading}>
								{isLoading ? <CircularProgress size={24} color='inherit' /> : 'Log In'}
							</Button>
							<div className='flex justify-center items-center flex-wrap gap-2'>
								<Typography>New on our platform?</Typography>
								<Typography component={Link} href='/register' color='primary'>
									Create an account
								</Typography>
							</div>

							{/* Social Oauth */}
							{/* <Divider className='gap-3'>or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div> */}
						</form>
					</div>
				</CardContent>
			</Card>
			<Illustrations maskImg={{ src: authBackground }} />
		</div>
	);
};

export default Login;
