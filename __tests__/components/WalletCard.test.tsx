import { render, screen, fireEvent } from '@testing-library/react';
import { WalletCard } from '@/components/WalletCard';

describe('WalletCard', () => {
  const mockOnConnect = jest.fn();
  const mockOnSwitchChain = jest.fn();
  const defaultSwitchableChains = [
    { chainId: 1, name: 'Ethereum Mainnet' },
    { chainId: 11155111, name: 'Sepolia' },
  ];

  const defaultProps = {
    network: null,
    switchableChains: defaultSwitchableChains,
    onSwitchChain: mockOnSwitchChain,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button when disconnected', () => {
    render(
      <WalletCard
        isConnected={false}
        isConnecting={false}
        account={null}
        balance="0"
        onConnect={mockOnConnect}
        {...defaultProps}
      />
    );

    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('calls onConnect when button is clicked', () => {
    render(
      <WalletCard
        isConnected={false}
        isConnecting={false}
        account={null}
        balance="0"
        onConnect={mockOnConnect}
        {...defaultProps}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));
    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it('shows connecting state', () => {
    render(
      <WalletCard
        isConnected={false}
        isConnecting={true}
        account={null}
        balance="0"
        onConnect={mockOnConnect}
        {...defaultProps}
      />
    );

    expect(screen.getByRole('button', { name: /connecting/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows connected state', () => {
    render(
      <WalletCard
        {...defaultProps}
        isConnected={true}
        isConnecting={false}
        account="0x1234567890123456789012345678901234567890"
        balance="1.5"
        onConnect={mockOnConnect}
        network={{ chainId: 1, name: 'Ethereum Mainnet', explorer: 'https://etherscan.io/tx/' }}
      />
    );

    const connectButton = screen.getByRole('button', { name: /connected/i });
    expect(connectButton).toBeInTheDocument();
    expect(connectButton).toBeDisabled();
  });

  it('displays account and balance when connected', () => {
    const account = '0x1234567890123456789012345678901234567890';
    render(
      <WalletCard
        {...defaultProps}
        isConnected={true}
        isConnecting={false}
        account={account}
        balance="1.5"
        onConnect={mockOnConnect}
        network={{ chainId: 1, name: 'Ethereum Mainnet', explorer: 'https://etherscan.io/tx/' }}
      />
    );

    expect(screen.getByText('Account:')).toBeInTheDocument();
    expect(screen.getByText('Balance:')).toBeInTheDocument();
    expect(screen.getByText('1.5 ETH')).toBeInTheDocument();
    
    // Check formatted address is displayed
    expect(screen.getByTitle(account)).toBeInTheDocument();
  });

  it('does not display account info when disconnected', () => {
    render(
      <WalletCard
        isConnected={false}
        isConnecting={false}
        account={null}
        balance="0"
        onConnect={mockOnConnect}
        {...defaultProps}
      />
    );

    expect(screen.queryByText('Account:')).not.toBeInTheDocument();
    expect(screen.queryByText('Balance:')).not.toBeInTheDocument();
  });

  it('does not display account info when account is null', () => {
    render(
      <WalletCard
        isConnected={true}
        isConnecting={false}
        account={null}
        balance="0"
        onConnect={mockOnConnect}
        {...defaultProps}
      />
    );

    expect(screen.queryByText('Account:')).not.toBeInTheDocument();
  });
});
