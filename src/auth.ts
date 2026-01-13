
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: "repo read:user user:email" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile) {
        token.username = profile.login
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error - accessToken is not in the default session type
      session.accessToken = token.accessToken
      // @ts-expect-error - username is not in the default user type
      session.user.username = token.username
      return session
    },
  },
})
