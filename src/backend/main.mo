import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Trip {
    public type Category = {
      #transport;
      #accommodation;
      #activity;
      #food;
    };

    public type Trip = {
      id : Nat;
      title : Text;
      destination : Text;
      startDate : Text;
      endDate : Text;
      description : Text;
      ownerId : Principal;
    };

    public type CreateTripArgs = {
      title : Text;
      destination : Text;
      startDate : Text;
      endDate : Text;
      description : Text;
    };

    public type UpdateTripArgs = {
      id : Nat;
      title : ?Text;
      destination : ?Text;
      startDate : ?Text;
      endDate : ?Text;
      description : ?Text;
    };
  };

  module Itinerary {
    public type ItineraryItem = {
      id : Nat;
      tripId : Nat;
      day : Nat;
      time : Text;
      title : Text;
      description : Text;
      location : Text;
      category : Text;
    };

    public type CreateItemArgs = {
      tripId : Nat;
      day : Nat;
      time : Text;
      title : Text;
      description : Text;
      location : Text;
      category : Text;
    };
  };

  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextTripId = 1;
  var nextItemId = 1;

  let trips = Map.empty<Nat, Trip.Trip>();
  let itineraryItems = Map.empty<Nat, Itinerary.ItineraryItem>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Trip CRUD operations
  public shared ({ caller }) func createTrip(args : Trip.CreateTripArgs) : async Trip.Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trips");
    };
    let trip = {
      id = nextTripId;
      title = args.title;
      destination = args.destination;
      startDate = args.startDate;
      endDate = args.endDate;
      description = args.description;
      ownerId = caller;
    };
    trips.add(nextTripId, trip);
    nextTripId += 1;
    trip;
  };

  public query ({ caller }) func getTripsByOwner(owner : Principal) : async [Trip.Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trips");
    };
    trips.values().toArray().filter(
      func(trip) {
        trip.ownerId == owner;
      }
    );
  };

  public query ({ caller }) func getTrip(id : Nat) : async ?Trip.Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    switch (trips.get(id)) {
      case (null) { null };
      case (?trip) {
        if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own trips");
        };
        ?trip;
      };
    };
  };

  public shared ({ caller }) func updateTrip(args : Trip.UpdateTripArgs) : async Trip.Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trips");
    };
    switch (trips.get(args.id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existingTrip) {
        if (existingTrip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this trip");
        };
        let updatedTrip : Trip.Trip = {
          id = existingTrip.id;
          title = switch (args.title) {
            case (null) { existingTrip.title };
            case (?title) { title };
          };
          destination = switch (args.destination) {
            case (null) { existingTrip.destination };
            case (?destination) { destination };
          };
          startDate = switch (args.startDate) {
            case (null) { existingTrip.startDate };
            case (?startDate) { startDate };
          };
          endDate = switch (args.endDate) {
            case (null) { existingTrip.endDate };
            case (?endDate) { endDate };
          };
          description = switch (args.description) {
            case (null) { existingTrip.description };
            case (?description) { description };
          };
          ownerId = existingTrip.ownerId;
        };
        trips.add(args.id, updatedTrip);
        updatedTrip;
      };
    };
  };

  public shared ({ caller }) func deleteTrip(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trips");
    };
    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this trip");
        };
        trips.remove(id);
        let itemIdsToRemove = itineraryItems.values().toArray().filter(
          func(item) {
            item.tripId == id;
          }
        ).map(func(item) { item.id });
        for (itemId in itemIdsToRemove.values()) {
          itineraryItems.remove(itemId);
        };
      };
    };
  };

  // Itinerary item CRUD operations
  public shared ({ caller }) func addItem(args : Itinerary.CreateItemArgs) : async Itinerary.ItineraryItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };
    switch (trips.get(args.tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this trip");
        };
        let item = {
          id = nextItemId;
          tripId = args.tripId;
          day = args.day;
          time = args.time;
          title = args.title;
          description = args.description;
          location = args.location;
          category = args.category;
        };
        itineraryItems.add(nextItemId, item);
        nextItemId += 1;
        item;
      };
    };
  };

  public query ({ caller }) func getItemsByTrip(tripId : Nat) : async [Itinerary.ItineraryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view items");
    };
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this trip");
        };
        itineraryItems.values().toArray().filter(
          func(item) {
            item.tripId == tripId;
          }
        );
      };
    };
  };

  public query ({ caller }) func getItem(id : Nat) : async ?Itinerary.ItineraryItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view items");
    };
    switch (itineraryItems.get(id)) {
      case (null) { null };
      case (?item) {
        switch (trips.get(item.tripId)) {
          case (null) { Runtime.trap("Trip not found") };
          case (?trip) {
            if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You do not own this trip");
            };
            ?item;
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateItem(args : Itinerary.CreateItemArgs, itemId : Nat) : async Itinerary.ItineraryItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update items");
    };
    switch (itineraryItems.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existingItem) {
        switch (trips.get(existingItem.tripId)) {
          case (null) { Runtime.trap("Trip not found") };
          case (?trip) {
            if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You do not own this trip");
            };
            let updatedItem : Itinerary.ItineraryItem = {
              id = existingItem.id;
              tripId = args.tripId;
              day = args.day;
              time = args.time;
              title = args.title;
              description = args.description;
              location = args.location;
              category = args.category;
            };
            itineraryItems.add(itemId, updatedItem);
            updatedItem;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete items");
    };
    switch (itineraryItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        switch (trips.get(item.tripId)) {
          case (null) { Runtime.trap("Trip not found") };
          case (?trip) {
            if (trip.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You do not own this trip");
            };
            itineraryItems.remove(id);
          };
        };
      };
    };
  };
};
