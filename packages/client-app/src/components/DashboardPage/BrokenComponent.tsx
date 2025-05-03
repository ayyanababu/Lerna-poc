import React, { useEffect } from 'react';

const BrokenComponent: React.FC = () => {
    useEffect(() => {
        // This will cause a runtime error because we're trying to access a property of undefined
        const causeError = undefined;
        // @ts-expect-error this is an intentional error
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        causeError.someProperty;
    }, []);

    return (
        <div>
            <h1>This component will break</h1>
            <p>You won't see this text because of the runtime error</p>
        </div>
    );
};

export default BrokenComponent;