import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Trip {
    id: bigint;
    title: string;
    destination: string;
    endDate: string;
    ownerId: Principal;
    description: string;
    startDate: string;
}
export interface CreateTripArgs {
    title: string;
    destination: string;
    endDate: string;
    description: string;
    startDate: string;
}
export interface UpdateTripArgs {
    id: bigint;
    title?: string;
    destination?: string;
    endDate?: string;
    description?: string;
    startDate?: string;
}
export interface ItineraryItem {
    id: bigint;
    day: bigint;
    title: string;
    tripId: bigint;
    time: string;
    description: string;
    category: string;
    location: string;
}
export interface CreateItemArgs {
    day: bigint;
    title: string;
    tripId: bigint;
    time: string;
    description: string;
    category: string;
    location: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItem(args: CreateItemArgs): Promise<ItineraryItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTrip(args: CreateTripArgs): Promise<Trip>;
    deleteItem(id: bigint): Promise<void>;
    deleteTrip(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: bigint): Promise<ItineraryItem | null>;
    getItemsByTrip(tripId: bigint): Promise<Array<ItineraryItem>>;
    getTrip(id: bigint): Promise<Trip | null>;
    getTripsByOwner(owner: Principal): Promise<Array<Trip>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateItem(args: CreateItemArgs, itemId: bigint): Promise<ItineraryItem>;
    updateTrip(args: UpdateTripArgs): Promise<Trip>;
}
