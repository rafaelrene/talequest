declare const process: {
  env: Record<string, string | undefined>;
};

const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN ?? "";

export default {
  providers: [
    {
      domain: issuerDomain,
      applicationID: "convex",
    },
  ],
};
