CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(4) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE train_wagons (
    id SERIAL PRIMARY KEY,
    train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    wagon_number VARCHAR(3) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    

    UNIQUE(train_id, wagon_number),
    UNIQUE(train_id, position)
);

CREATE UNIQUE INDEX idx_trains_train_number ON trains(train_number);
CREATE INDEX idx_train_wagons_train_id ON train_wagons(train_id);
CREATE INDEX idx_train_wagons_position ON train_wagons(train_id, position);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_trains_updated_at 
    BEFORE UPDATE ON trains 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();