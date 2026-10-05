import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Bileşenlerde düz useDispatch / useSelector yerine bunlar kullanılır: state ve dispatch tipli gelir.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
