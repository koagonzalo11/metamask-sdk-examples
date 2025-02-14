import { createContext, type ReactNode, type FC, useRef } from 'react';
import { MetamaskMultichain } from '@metamask/sdk-multichain';


export const MultichainContext = createContext<MetamaskMultichain | null>(null);

type Props = {
	children: ReactNode;
}

export const MultichainProvider: FC<Props> = ({ children }) => {
	const client = useRef<MetamaskMultichain>(new MetamaskMultichain());

	return (
		<MultichainContext.Provider value={client.current}>
			{children}
		</MultichainContext.Provider>
	);
};

