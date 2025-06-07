CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(4) NOT NULL,
    departure_station_code INTEGER NOT NULL,
    arrival_station_code INTEGER NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_trips_train_number 
        FOREIGN KEY (train_number) 
        REFERENCES trains(train_number) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_trips_departure_station 
        FOREIGN KEY (departure_station_code) 
        REFERENCES stations(code) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_trips_arrival_station 
        FOREIGN KEY (arrival_station_code) 
        REFERENCES stations(code) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trips_train_number ON trips(train_number);
CREATE INDEX IF NOT EXISTS idx_trips_departure_station ON trips(departure_station_code);
CREATE INDEX IF NOT EXISTS idx_trips_arrival_station ON trips(arrival_station_code);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_route_date ON trips(departure_station_code, arrival_station_code, DATE(departure_time));

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $FUNC$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $FUNC$ language 'plpgsql';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_trips_updated_at'
    ) THEN
        CREATE TRIGGER update_trips_updated_at 
            BEFORE UPDATE ON trips 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;