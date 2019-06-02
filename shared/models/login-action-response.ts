import { UserProfile } from './user-profile';

export interface LoginActionResponse { 
    token: string, 
    profile: UserProfile
}
