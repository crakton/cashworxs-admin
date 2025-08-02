'use client';
// MUI Imports
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar';

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu';

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu';

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav';

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon';

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles';
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles';

type RenderExpandIconProps = {
	open?: boolean;
	transitionDuration?: VerticalMenuContextProps['transitionDuration'];
};

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
	<StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
		<i className='ri-arrow-right-s-line' />
	</StyledVerticalNavExpandIcon>
);

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
	// Hooks
	const theme = useTheme();
	const { isBreakpointReached, transitionDuration } = useVerticalNav();

	const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar;

	return (
		// eslint-disable-next-line lines-around-comment
		/* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
		<ScrollWrapper
			{...(isBreakpointReached
				? {
						className: 'bs-full overflow-y-auto overflow-x-hidden',
						onScroll: container => scrollMenu(container, false)
					}
				: {
						options: { wheelPropagation: false, suppressScrollX: true },
						onScrollY: container => scrollMenu(container, true)
					})}
		>
			{/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
			{/* Vertical Menu */}
			<Menu
				menuItemStyles={menuItemStyles(theme)}
				renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
				renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
				menuSectionStyles={menuSectionStyles(theme)}
			>
				<MenuSection label='Cashworxs Admin'>
					<MenuItem href='/' icon={<i className='ri-home-smile-line' />}>
						Dashboard
					</MenuItem>
					<MenuItem href='/users' icon={<i className='ri-user-line' />}>
						Users
					</MenuItem>
				</MenuSection>

				<MenuSection label='Content Management'>
					<MenuItem href='/onboarding' icon={<i className='ri-user-follow-line' />}>
						Onboarding
					</MenuItem>
					<MenuItem href='/users/activity' icon={<i className='ri-history-line' />}>
						Learn-more Details
					</MenuItem>
				</MenuSection>

				<MenuSection label='Transactions'>
					<SubMenu label='Payments' icon={<i className='ri-secure-payment-line' />}>
						<MenuItem href='/platforms/payments'>Receipts</MenuItem>
						<MenuItem href='/platforms/invoices' icon={<i className='ri-exchange-dollar-line' />}>
							Invoices
						</MenuItem>
					</SubMenu>
					{/* <MenuItem href='/transactions' icon={<i className='ri-exchange-funds-line' />}>
						All Transactions
					</MenuItem> */}
				</MenuSection>

				<MenuSection label='Settings'>
					<MenuItem icon={<i className='ri-info-card-line' />} href='/settings/id-config'>
						Identity Configuration
					</MenuItem>
					<MenuItem href='/organizations' icon={<i className='ri-building-line' />}>
						Create Organizations
					</MenuItem>
					<MenuItem icon={<i className='ri-global-line' />} href='/services/fees'>
						Fees
					</MenuItem>
					<MenuItem icon={<i className='ri-government-line' />} href='/services/taxes'>
						Taxes
					</MenuItem>

					<SubMenu label='General Settings' icon={<i className='ri-settings-line' />}>
						<MenuItem href='/settings/user-roles' icon={<i className='ri-user-settings-line' />}>
							User Roles
						</MenuItem>
						<MenuItem href='/notifications' icon={<i className='ri-notification-line' />}>
							Notifications
						</MenuItem>
					</SubMenu>
				</MenuSection>
			</Menu>
		</ScrollWrapper>
	);
};

export default VerticalMenu;
