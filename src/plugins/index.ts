import { FromJsToTsPlugin } from './from-js-to-ts';
import { NewYarn } from './new-yarn';
import { Prettier } from './prettier';

export default [new NewYarn(), new FromJsToTsPlugin(), new Prettier()];
